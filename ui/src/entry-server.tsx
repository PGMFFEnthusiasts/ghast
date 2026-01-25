import { createHandler, StartServer } from '@solidjs/start/server';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang='en'>
        <head>
          <meta charset='utf-8' />
          <link href='/brady_logo.png' rel='icon' type='image/png' />
          <meta
            content='width=device-width, initial-scale=1.0'
            name='viewport'
          />
          <title>Brady</title>
          {assets}
        </head>
        <body>
          <div id='app'>{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
