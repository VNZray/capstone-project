declare module 'react-native-webview' {
  import { Component } from 'react';
    import { ViewProps } from 'react-native';

  export interface WebViewProps extends ViewProps {
    source?: any;
    onShouldStartLoadWithRequest?: (event: any) => boolean;
    javaScriptEnabled?: boolean;
    domStorageEnabled?: boolean;
    startInLoadingState?: boolean;
    decelerationRate?: 'normal' | 'fast' | number;
    mixedContentMode?: 'never' | 'always' | 'compatibility';
  }

  export class WebView extends Component<WebViewProps> {}
  const _default: typeof WebView;
  export default _default;
}
