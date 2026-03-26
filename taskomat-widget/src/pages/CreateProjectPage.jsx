import PageHeader from '../components/shared/PageHeader'
import ProjectWizard from '../components/widget/ProjectWizard'

export default function CreateProjectPage() {
  return (
    <div className="page-wrapper">
      <PageHeader
        title="Crea nuovo progetto"
        subtitle="Segui i passaggi per configurare cliente, budget, workunit e task."
      />
      <ProjectWizard />
    </div>
  )
}
