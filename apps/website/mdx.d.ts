declare module "*.mdx" {
  import * as React from "react";

  // Component default export that accepts the MDX `components` prop and any props
  const MDXComponent: React.ComponentType<
    {
      components?: Record<string, React.ComponentType<any>>;
    } & Record<string, any>
  >;

  export default MDXComponent;
}
