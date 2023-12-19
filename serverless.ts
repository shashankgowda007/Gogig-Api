import type { AWS } from '@serverless/typescript';

import { getGigProfileStaticData } from '@functions/gigSeeker';
import { getAllGigDetails, saveGigDetails, updateGigDetails, getGigDetailsByEmployerId, getGigDetailsByGigId, saveQuestionaire, getQuestionaire } from '@functions/gig';
import { getCompanyDetails, saveCompanyDetails, updateCompanyDetails } from '@functions/company';
import { getVisibilityDetails, saveVisibilityDetails } from '@functions/visibility';
import { getAcceptanceByGigSeekerId, getAcceptanceDetailsByAcceptanceId, getAcceptanceDetailsByGigIdAndGigSeekerId, getListOfGigsAcceptedByGigSeeker, getPreAcceptanceForm, saveAcceptance, sendForPayment, statusUpdate } from '@functions/acceptance';
import { getAllResponses, getResponseByGigSeekerId, assignToGigSeeker, getAssignedDetails, removeAssignment, updateResponse, getResponseQuestionnaire, getQuestionaireResponseByGigId, aggregateInformation } from '@functions/response';
import { verifyAcceptance, verifyCompany, verifyEmployer, verifyGig, verifyGigSeeker, getUnVerifiedSeekers,getUnVerifiedGigs, getUnVerifiedAcceptances, emailVerification, approvePayment, listOfPaymentsToApprove, completeGig, getOpenQueries, resolveOpenQuery } from '@functions/validation';

const serverlessConfiguration: AWS = {
  service: 'gogig-api',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-dotenv-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    vpc: {
      securityGroupIds: ['sg-0ee5094cf26a79fa2'],
      subnetIds: ['subnet-04c89331bb8ee47e9',
        'subnet-0cfee0ca23f85bec0',
        'subnet-013a4c2d0e35fe102',
        'subnet-086358035407b346f',
        'subnet-0a9c13a283ff54962',
        'subnet-0b0aa2cb4064a2ad6'
      ]
    },
    httpApi: {
      cors: true
    }

  },
  // import the function via paths
  functions: {
    getGigProfileStaticData,
    getGigDetailsByGigId, getAllGigDetails, getGigDetailsByEmployerId, saveGigDetails, updateGigDetails,
    getQuestionaire, saveQuestionaire,
    saveCompanyDetails, getCompanyDetails, updateCompanyDetails,
    saveVisibilityDetails, getVisibilityDetails,
    saveAcceptance, statusUpdate, getListOfGigsAcceptedByGigSeeker, getAcceptanceDetailsByAcceptanceId, 
    getAcceptanceByGigSeekerId, getAcceptanceDetailsByGigIdAndGigSeekerId, getPreAcceptanceForm,
    getAllResponses, getResponseByGigSeekerId, assignToGigSeeker, updateResponse, getAssignedDetails, 
    removeAssignment, getResponseQuestionnaire, getQuestionaireResponseByGigId,
    verifyAcceptance, verifyCompany, verifyEmployer, verifyGig, verifyGigSeeker, getUnVerifiedSeekers, 
    getUnVerifiedGigs, getUnVerifiedAcceptances, sendForPayment, emailVerification, completeGig, getOpenQueries,
    listOfPaymentsToApprove, approvePayment, resolveOpenQuery, aggregateInformation,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['better-sqlite3', 'oracledb', 'pg', 'tedious', 'mysql2', 'pg-query-stream', 'sqlite3'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;