import styles from './page.module.css'
import OutputCodeEditor from '@/components/OutputCodeEditor'

export default function Home() {
  return (
    <main className={styles.main}>
      <OutputCodeEditor />
    </main>
  )
}
