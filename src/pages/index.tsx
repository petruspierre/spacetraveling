import { GetStaticProps } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiUser, FiCalendar } from 'react-icons/fi';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
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

const posts = [
  {
    title: 'Como utilizar hooks',
    subtitle: 'Pensando em sincronização em vez de ciclos de vida.',
    date: new Date(),
    author: 'Petrus Pierre',
  },
  {
    title: 'Como utilizar hooks 2',
    subtitle: 'Pensando em sincronização em vez de ciclos de vida.',
    date: new Date(),
    author: 'Petrus Bento',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <div className={styles.container}>
        <ul className={styles.postList}>
          {posts.map(post => (
            <li key={post.title}>
              <h2>{post.title}</h2>
              <p>{post.subtitle}</p>
              <div>
                <div>
                  <FiCalendar size="1.5rem" />
                  <p>{format(post.date, 'dd MMM yyyy', { locale: ptBR })}</p>
                </div>
                <div>
                  <FiUser size="1.5rem" />
                  <p>{post.author}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
