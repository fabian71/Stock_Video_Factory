import {Composition} from 'remotion';
import {StockVideoFactory} from './StockVideoFactory';
import {
  DEFAULT_FACTORY_PROPS,
  formatToDimensions,
  stockFactorySchema,
} from './config/factoryConfig';

export const Root = () => {
  const dimensions = formatToDimensions(
    DEFAULT_FACTORY_PROPS.format,
    DEFAULT_FACTORY_PROPS.resolution,
  );

  return (
    <Composition
      id="StockVideoFactory"
      component={StockVideoFactory}
      durationInFrames={DEFAULT_FACTORY_PROPS.durationSeconds * DEFAULT_FACTORY_PROPS.fps}
      fps={DEFAULT_FACTORY_PROPS.fps}
      width={dimensions.width}
      height={dimensions.height}
      schema={stockFactorySchema}
      defaultProps={DEFAULT_FACTORY_PROPS}
      calculateMetadata={({props}) => {
        const parsed = stockFactorySchema.parse(props);
        const size = formatToDimensions(parsed.format, parsed.resolution);

        return {
          durationInFrames: parsed.durationSeconds * parsed.fps,
          fps: parsed.fps,
          width: size.width,
          height: size.height,
        };
      }}
    />
  );
};
