import type { ReactNode } from 'react'
import styles from './Page.module.css'

type PageProps = {
  children: ReactNode
}

export function Page({ children }: PageProps) {
  return <main className={styles.root}>{children}</main>
}
