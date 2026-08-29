// react-native-web ships no TypeScript declarations of its own. We only
// use its unstable_createElement escape hatch (to render real DOM
// elements like <form>/<input> for browser password-manager support -
// see src/screens/AuthScreen.web.tsx), so that's all this declares.
declare module 'react-native-web' {
  export function unstable_createElement(
    component: string,
    props?: Record<string, unknown>
  ): React.ReactElement;
}
