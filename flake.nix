{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane.url = "github:ipetkov/crane";
    systems.url = "systems";
  };

  outputs = {
    nixpkgs,
    crane,
    systems,
    fenix,
    ...
  }: let
    eachSystem = f: nixpkgs.lib.genAttrs (import systems) (system: f nixpkgs.legacyPackages.${system});
  in {
    packages = eachSystem (pkgs: let
      craneLib = crane.mkLib pkgs;
    in {
      default = craneLib.buildPackage {
        src = craneLib.cleanCargoSource ./.;
        buildInputs = [
          pkgs.openssl
          pkgs.pkg-config
        ];
      };
    });

    devShells = eachSystem ({
      pkgs,
      system,
      lib,
      ...
    }: {
      default = let
        mkScript = name: text: let
          script = pkgs.writeShellScriptBin name text;
        in
          script;

        scripts = [
          (mkScript "dev" ''docker compose up --wait -d && bacon run-long-release && docker compose down'')
        ];
      in
        pkgs.mkShell {
          buildInputs = let
            f = fenix.packages.${system};
          in
            [
              pkgs.bacon
              pkgs.postgresql_18
              (f.latest.withComponents [
                "cargo"
                "clippy"
                "rust-src"
                "rustc"
                "rustfmt"
              ])
            ]
            ++ scripts;
          LD_LIBRARY_PATH = lib.makeLibraryPath [pkgs.openssl];
        };
    });
  };
}
