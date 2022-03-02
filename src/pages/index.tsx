import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const fetchNextPage = async () => {
    try {
      const response = await fetch(nextPage, {
        method: 'GET',
      });
      const responseJson = await response.json();

      setPosts([...posts, ...responseJson.results]);
      setNextPage(responseJson.next_page);
    } catch {
      alert('erro');
    }
  };

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <div className={styles.container}>
        <img src="Logo.svg" alt="logo" />
        <ul className={styles.postList}>
          {posts.map(post => (
            <li key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h2>{post.data.title}</h2>
                  <p>{post.data.subtitle}</p>
                </a>
              </Link>
              <div>
                <div>
                  <FiCalendar size="1.5rem" />
                  <p>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </p>
                </div>
                <div>
                  <FiUser size="1.5rem" />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {nextPage && (
          <button
            type="button"
            onClick={fetchNextPage}
            title="Carregar mais posts"
            aria-label="Carregar mais posts"
          >
            Carregar mais posts
          </button>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['publication.type', 'publication.subtitle', 'publication.author'],
      pageSize: 1,
    }
  );

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
