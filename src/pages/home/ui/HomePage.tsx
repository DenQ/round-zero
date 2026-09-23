import reactLogo from '@shared/assets/react.svg'
import viteLogo from '@shared/assets/vite.svg'
import { Page } from '@shared/ui/Page'

export function HomePage() {
  return (
    <Page>
      <h1>round-zero</h1>
      <p>React + TypeScript + FSD</p>
      <div>
        <img src={viteLogo} alt="Vite" width={48} height={48} />
        <img src={reactLogo} alt="React" width={48} height={48} />
      </div>
    </Page>
  )
}
