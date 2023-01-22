#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const { esbuildDecorators } = require('@anatine/esbuild-decorators')
const { build } = require('esbuild')
const fs = require('fs')

const controllers = fs
  .readdirSync('src/application/http/controllers', { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => `src/application/http/controllers/${item.name}/index.ts`)

const sqsHandlers = fs
  .readdirSync('src/application/sqs/handlers', { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => `src/application/sqs/handlers/${item.name}/index.ts`)

build({
  logLevel: 'info',
  entryPoints: [...controllers, ...sqsHandlers],
  bundle: true,
  outbase: 'src',
  outdir: 'cdk/build',
  metafile: true,
  external: ['pg-native'],
  platform: 'node',
  minify: true,
  plugins: [esbuildDecorators()],
}).catch(() => process.exit(1))
