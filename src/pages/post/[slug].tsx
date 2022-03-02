import { Fragment } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const calcEstimatedTime = () => {
    const totalWords = post.data.content.reduce((total, currentPost) => {
      const bodyWords = RichText.asText(currentPost.body).split(' ');
      const headingWords = currentPost.heading.split(' ');
      return total + bodyWords.length + headingWords.length;
    }, 0);

    return Math.ceil(totalWords / 200);
  };

  return (
    <>
      <Head>
        <title>spacetraveling | {post.data.title}</title>
      </Head>
      <div>
        <Header />
        <main className={styles.content}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <article className={styles.article}>
            <h1>{post.data.title}</h1>
            <div className={styles.infoWrapper}>
              <div>
                <FiCalendar size="1.5rem" />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
              </div>
              <div>
                <FiUser size="1.5rem" />
                <p>{post.data.author}</p>
              </div>
              <div>
                <FiClock size="1.5rem" />
                <p>{calcEstimatedTime()} min</p>
              </div>
            </div>
            {post.data.content.map((content, index) => (
              <Fragment key={String(index)}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </Fragment>
            ))}
          </article>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const slugs = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const response = (await prismic.getByUID(
    'posts',
    String(params.slug),
    {}
  )) as Post;

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
