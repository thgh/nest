import { RequestMethod } from '@nestjs/common';
import { expect } from 'chai';
import { ApplicationConfig } from '../application-config';
import { NestContainer } from '../injector/container';
import { GraphInspector } from '../inspector/graph-inspector';
import { NestApplication } from '../nest-application';
import { mapToExcludeRoute } from './../middleware/utils';
import { NoopHttpAdapter } from './utils/noop-adapter.spec';

describe('NestApplication', () => {
  describe('Hybrid Application', () => {
    class Interceptor {
      public intercept(context, next) {
        return next();
      }
    }
    it('default should use new ApplicationConfig', () => {
      const applicationConfig = new ApplicationConfig();
      const container = new NestContainer(applicationConfig);
      const instance = new NestApplication(
        container,
        new NoopHttpAdapter({}),
        applicationConfig,
        new GraphInspector(container),
        {},
      );
      instance.useGlobalInterceptors(new Interceptor());
      const microservice = instance.connectMicroservice({});
      expect((instance as any).config.getGlobalInterceptors().length).to.equal(
        1,
      );
      expect(
        (microservice as any).applicationConfig.getGlobalInterceptors().length,
      ).to.equal(0);
    });
    it('should inherit existing ApplicationConfig', () => {
      const applicationConfig = new ApplicationConfig();
      const container = new NestContainer(applicationConfig);
      const instance = new NestApplication(
        container,
        new NoopHttpAdapter({}),
        applicationConfig,
        new GraphInspector(container),
        {},
      );
      instance.useGlobalInterceptors(new Interceptor());
      const microservice = instance.connectMicroservice(
        {},
        { inheritAppConfig: true },
      );
      expect((instance as any).config.getGlobalInterceptors().length).to.equal(
        1,
      );
      expect(
        (microservice as any).applicationConfig.getGlobalInterceptors().length,
      ).to.equal(1);
    });
  });
  describe('Global Prefix', () => {
    it('should get correct global prefix options', () => {
      const applicationConfig = new ApplicationConfig();
      const container = new NestContainer(applicationConfig);
      const instance = new NestApplication(
        container,
        new NoopHttpAdapter({}),
        applicationConfig,
        new GraphInspector(container),
        {},
      );
      const excludeRoute = ['foo', { path: 'bar', method: RequestMethod.GET }];
      instance.setGlobalPrefix('api', {
        exclude: excludeRoute,
      });
      expect(applicationConfig.getGlobalPrefixOptions()).to.eql({
        exclude: mapToExcludeRoute(excludeRoute),
      });
    });
  });
});
