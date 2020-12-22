#!/usr/bin/env node
'use strict'
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const AJV = require('ajv')
// const { writeFile } = require('fs/promises')
const $RefParser = require('@apidevtools/json-schema-ref-parser')
const schema = require('rdmo-json-schema').schema
const ajv = new AJV()
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
  .parse()
