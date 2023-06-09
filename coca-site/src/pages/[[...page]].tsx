import React from 'react';
import { useRouter } from 'next/router';
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import DefaultErrorPage from 'next/error';
import Head from 'next/head';

import { Builder } from '@builder.io/react';
import dynamic from "next/dynamic";

// Replace with your Public API Key
builder.init('63508ae4144c457e90c900e821dea7b1');

export async function getStaticProps({ params }) {
  // Fetch the builder content
  const urlPath = '/' + (params?.page?.join('/') || '');
  const page = await builder
    .get('page', {
      userAttributes: {
        urlPath
      },
    })
    .toPromise();

  const header = await builder
    .get('header', { 
      userAttributes: { 
        urlPath
      } 
    })
    .toPromise();

  const footer = await builder
    .get('footer', { 
      userAttributes: { 
        urlPath
      } 
    })
    .toPromise();

  return {
    props: {
      page: page || null,
      header: header || null,
      footer: footer || null
    },
    revalidate: 5
  };
}

export async function getStaticPaths() {
  // Get a list of all pages in builder
  const pages = await builder.getAll('page', {
    // We only need the URL field
    fields: 'data.url', 
    options: { noTargeting: true },
  });

  return {
    paths: pages.map(page => `${page.data?.url}`),
    fallback: true,
  };
}

export default function Page({ page, header }) {
  const router = useRouter();
  const isPreviewing = useIsPreviewing();

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />
  }

  return (
    <>
      <Head>
        <title>{page?.data.title}</title>
      </Head>
      {/* Render the Builder page */}
      <BuilderComponent model="header" content={header} />
      <BuilderComponent model="page" content={page} />
      <BuilderComponent model="footer" content={footer} />
    </>
  );
}