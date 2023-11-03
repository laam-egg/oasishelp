import styles from './page.module.css'
import OutputCodeEditor from '@/components/OutputCodeEditor'

export default function Home() {
  return (
    <main className={styles.main}>
      <OutputCodeEditor />
      <br />
      <div><a href='https://github.com/laam-egg/oasishelp' target='_blank'>View source code on GitHub.</a></div>
    </main>
  )
}
