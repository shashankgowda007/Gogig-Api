import { handlerPath } from '@libs/handler-resolver';

export const getGigProfileStaticData = {
  handler: `${handlerPath(__dirname)}/handler.getGigProfileStaticData`,
  events: [
    {
      http: {
        method: 'get',
        path: '/getGigProfileStaticData',
        cors: true
      },
    },
  ],
};

export const getGigSeekerDetails = {
  handler: `${handlerPath(__dirname)}/handler.getGigSeekerDetails`,
  events: [
    {
      http: {
        method: 'get',
        path: '/getGigSeekerDetails',
        cors: true
      },
    },
  ],
};

export const saveGigSeekerDetails = {
  handler: `${handlerPath(__dirname)}/handler.saveGigSeekerDetails`,
  events: [
    {
      http: {
        method: 'post',
        path: '/saveGigSeekerDetails',
        cors: true
      },
    },
  ],
};

export const updateGigSeekerDetails = {
  handler: `${handlerPath(__dirname)}/handler.updateGigSeekerDetails`,
  events: [
    {
      http: {
        method: 'patch',
        path: '/updateGigSeekerDetails',
        cors: true
      },
    },
  ],
};

export const removeGigSeeker = {
  handler: `${handlerPath(__dirname)}/handler.removeGigSeeker`,
  events: [
    {
      http: {
        method: 'delete',
        path: '/removeGigSeeker',
        cors: true
      },
    },
  ],
};

export const GigSeekerDetails = {
  handler: `${handlerPath(__dirname)}/handler.columnListGigSeeker`,
  events: [
    {
      http: {
        method: 'get',
        path: '/gigSeekerAttributes',
        cors: true
      },
    },
  ],
};

export const seekerProfilePhotoUpload = {
  handler: `${handlerPath(__dirname)}/handler.seekerProfilePhotoUpload`,
  events: [
      {
          http: {
              method: 'patch',
              path: '/seekerProfilePhotoUpload',
              cors: true
          },
      },
  ],
};