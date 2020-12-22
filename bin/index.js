#!/usr/bin/env node
'use strict'
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const shell = require('shelljs')
const AJV = require('ajv')
const { writeFile } = require('fs/promises')
const $RefParser = require('@apidevtools/json-schema-ref-parser')
const schema = require('rdmo-json-schema').schema
const serialize = require('rdmo-json2xml')

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
  .command('export <project>', 'Export your catalog to xml for being imported into RDMO', (yargs) => {
    yargs
      .positional('project', {
        description: 'The root file of your RDMO catalog'
      })
      .option('domain', {
        type: 'boolean',
        description: 'Export the domain of your catalog',
        default: true
      })
      .option('options', {
        type: 'boolean',
        description: 'Export the optionsets of your catalog',
        default: true
      })
      .option('questions', {
        type: 'boolean',
        description: 'Export the questions of your catalog',
        default: true
      })
      .option('out', {
        alias: 'o',
        type: 'string',
        description: 'Output directory where to write the xml files',
        default: '.'
      })
  }, async (argv) => {
    shell.mkdir('-p', argv.out)
    const data = await $RefParser.dereference(argv.project, { resolve: { http: false } })
    if (argv.domain === true) {
      const xml = serialize.domain(data)
      const filename = path.join(argv.out, 'domain.xml')
      await writeFile(filename, xml)
      console.log(`domain written to ${filename}`)
    }
    if (argv.options === true) {
      const xml = serialize.options(data)
      const filename = path.join(argv.out, 'options.xml')
      await writeFile(filename, xml)
      console.log(`options written to ${filename}`)
    }
    if (argv.questions === true) {
      const xml = serialize.questions(data)
      const filename = path.join(argv.out, 'questions.xml')
      await writeFile(filename, xml)
      console.log(`question catalog written to ${filename}`)
    }
  })
  .parse()
