{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    systems.url = "systems";
  };

  outputs = {
    systems,
    nixpkgs,
    ...
  }: let
    eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
  in {
    devShells = eachSystem (pkgs: let
      mkScript = name: text: let
        script = pkgs.writeShellScriptBin name text;
      in
        script;

      scripts = [
        (mkScript "dev" ''bun dev'')
        (mkScript "build" ''bun run build'')
        (mkScript "lint" ''oxlint && bunx eslint .'')
        (mkScript "lint:fix" ''oxlint --fix --fix-suggestions && bunx eslint . --fix'')
        (mkScript "haod" ''bunx @hiddenability/opinionated-defaults@latest'')
        (mkScript "test:e2e" ''bun playwright test'')
        (mkScript "test:e2e:ui" ''
          echo "Starting Playwright UI on http://localhost:8077"
          bun playwright test --ui-port 8077 --ui-host localhost
        '')
      ];
    in {
      default = pkgs.mkShell {
        buildInputs = with pkgs;
          [
            bun
            nodejs_24
            oxlint
            playwright-driver.browsers
            chromium
          ]
          ++ scripts;

        shellHook = ''
          export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
          export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$(echo ${pkgs.playwright-driver.browsers}/chromium-*/chrome-linux/chrome)
          export PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH=$(echo ${pkgs.playwright-driver.browsers}/firefox-*/firefox/firefox)
          export CHROME_PATH=${pkgs.chromium}/bin/chromium
        '';
      };
    });
  };
}
