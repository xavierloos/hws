import axios from "axios";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // fetch data
  // const { slug } = params;
  // const product = "";
  // await axios.get(`/api/blogs/${slug}`).then((res) => {
  //   console.log(res.data);
  // });

  // console.log(product);
  // optionally access and extend (rather than replace) parent metadata
  //   const previousImages = (await parent).openGraph?.images || [];

  return {
    // title: product.title,
    openGraph: {
      images: ["/some-specific-page-image.jpg"],
    },
  };
}

interface BlogLayoutProps {
  children: React.ReactNode;
}
const BlogLayout = async ({ children }: BlogLayoutProps) => {
  return <>{children}</>;
};
export default BlogLayout;
