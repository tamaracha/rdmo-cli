#!/usr/bin/env node
'use strict'
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const AJV = require('ajv/dist/2019').default
const formats = require('ajv-formats')
const { dump } = require('js-yaml')
const $RefParser = require('@apidevtools/json-schema-ref-parser')
const { schema } = require('@rdmo-author/schema')
const { write } = require('@rdmo-author/xml')

const ajv = new AJV({
  formats: {
    uri: formats.get('uri'),
    'uri-reference': formats.get('uri-reference')
  }
})
  .addKeyword({
    keyword: 'tsType',
    schemaType: 'string',
    valid: true
  })
const validate = ajv.compile(schema)

yargs(hideBin(process.argv))
  .command('validate <project>', 'Validate your project', (yargs) => {
    yargs
      .option('consistency', {
        alias: 'c',
        type: 'boolean',
        description: 'Run consistency checks on the project (currently not implemented)',
        default: false
      })
      .positional('project', {
        description: 'The root file of your RDMO catalog'
      })
  }, async (argv) => {
    const data = await $RefParser.dereference(argv.project, { resolve: { http: false } })
    if (validate(data) === false) {
      console.log(ajv.errorsText(validate.errors, { separator: '\n', dataVar: 'catalog' }))
    } else {
      console.log('Your catalog is valid')
    }
  })
  .command('export <project>', 'Export your catalog to xml for being imported into RDMO', (yargs) => {
    yargs
      .positional('project', {
        description: 'The root file of your RDMO catalog'
      })
  }, async (argv) => {
    const data = await $RefParser.dereference(argv.project, { resolve: { http: false } })
    await process.stdout.write(write(data))
  })
  .command('bundle <project>', 'Bundle a catalog spread over multiple files into one single file', yargs => {
    yargs
      .positional('project', {
        description: 'The root file of your RDMO catalog'
      })
      .option('format', {
        alias: 'f',
        type: 'string',
        choices: ['json', 'yaml'],
        description: 'Output directory where to write the xml files',
        default: 'json'
      })
  }, async (argv) => {
    const data = await $RefParser.bundle(argv.project, { resolve: { http: false } })
    if (argv.format === 'yaml') {
      await process.stdout.write(dump(data))
    } else {
      await process.stdout.write(JSON.stringify(data, null, 2))
    }
  })
  .parse()
