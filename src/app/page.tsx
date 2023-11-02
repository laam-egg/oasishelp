import Image from 'next/image'
import styles from './page.module.css'
import OutputCodeEditor from '@/components/OutputCodeEditor'
import ClassMemberTable from '@/components/ClassPropertyTable'

export default function Home() {
  return (
    <main className={styles.main}>
      <OutputCodeEditor />
    </main>
  )
}
