#!/usr/bin/env node
import 'source-map-support/register'
import { App, StackProps } from 'aws-cdk-lib'
import { getAccount, getRegion, getServiceName } from './config/environment'
import { MainStack } from './stack/main-stack'

const mainStackName = getServiceName()

const props: StackProps = {
  env: {
    region: getRegion(),
    account: getAccount(),
  },
}

const app = new App()
new MainStack(app, mainStackName, props)
