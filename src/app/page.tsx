import styles from './page.module.css'
import JClassCodeArea from '@/components/JClassCodeArea'

export default function Home() {
  return (
    <main className={styles.main}>
      <JClassCodeArea />
      <br />
      <div><a href='https://github.com/laam-egg/oasishelp' target='_blank'>View source code on GitHub.</a></div>
    </main>
  )
}
