'use client';

import { useEffect, useState } from 'react';

import { deleteCommunityPost, getCommunityAdminPosts, type CommunityAdminPost } from '@/lib/firebase/admin-community-data';

import { AdminShell } from './admin-shell';
import styles from './admin-page.module.css';

export function AdminCommunityPage() {
  const [posts, setPosts] = useState<CommunityAdminPost[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      setPosts(await getCommunityAdminPosts());
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Community posts could not load.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function remove(post: CommunityAdminPost) {
    if (!window.confirm(`Remove this post by ${post.authorName}?`)) return;
    try {
      await deleteCommunityPost(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setNotice('Community post removed.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Post could not be removed.');
    }
  }

  return (
    <AdminShell activeKey="community" pageTitle="Community Feed" pageSummary="Review and remove Community posts while keeping private group content separate.">
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div><div className={styles.panelLabel}>Moderation queue</div><h2 className={styles.panelTitle}>{posts.length} recent community posts</h2></div>
          <button className={styles.secondaryButton} type="button" onClick={() => void refresh()} disabled={loading}>Refresh</button>
        </div>
        {notice ? <div className={styles.panelBody}><p className={styles.mutedText}>{notice}</p></div> : null}
        <div className={styles.queueBoard}>
          {posts.map((post) => (
            <article className={styles.queueCard} key={post.id}>
              <div className={styles.queuePrimary}>{post.authorName}</div>
              <div className={styles.queueSecondary}>{post.createdAtLabel} · {post.attachmentCount} attachment{post.attachmentCount === 1 ? '' : 's'}</div>
              <p className={styles.mutedText}>{post.body}</p>
              <button className={styles.secondaryButton} type="button" onClick={() => void remove(post)}>Remove post</button>
            </article>
          ))}
        </div>
        {!loading && posts.length === 0 ? <div className={styles.panelBody}><p className={styles.mutedText}>No Community posts found.</p></div> : null}
      </section>
    </AdminShell>
  );
}
