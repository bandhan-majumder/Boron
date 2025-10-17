<div align="center">

<img src="assets/image.png" alt="logo" width="full" style="border: 1px solid #ccc; border-radius: 8px;" />

### BoronGPT - A GPT wrapper that actually builds your MVP

</div>

### Dev Setup

```
git clone https://github.com/bandhan-majumder/BoronGPT
cd BoronGPT
```

then, install al the dependencies with

```
pnpm install
```

add your Claude-API key and preferred model anme to the .env file by copying

```
mv apps/web/.env.example .env
```

then run the app by

```
pnpm dev
```

based on the url,
your .env values will be like this;

```
NEXTAUTH_SECRET="your-nextauth-secret"
// collect from here https://console.cloud.google.com/auth/clients by making a project
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```
