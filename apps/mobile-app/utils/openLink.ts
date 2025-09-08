import * as WebBrowser from "expo-web-browser";

export const openLink = (url: string) => {
  WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, // iOS style
  });
};
