/*instrumentation.ts*/

import { trace } from '@opentelemetry/api';

const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const Pyroscope = require('@pyroscope/nodejs');


const instrumentations = getNodeAutoInstrumentations();

export const start = () => {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [instrumentations],
  });

  sdk.start();

  if (process.env.PYROSCOPE_ENABLED === 'true') {
    console.log('starting pyroscope');
    Pyroscope.init({
      serverAddress: process.env.PYROSCOPE_SERVER_ADDRESS,
      appName: process.env.PYROSCOPE_APPLICATION_NAME,
      wallCollectCpuTime: true
    })

    Pyroscope.start();
  }
};

export const wrapWithLabels = <T,>(labels: Record<string, string>, fn: () => T): T => {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(labels);
  }

  return Pyroscope.wrapWithLabels(labels, () => fn());
};