import { BadgeCheck, BriefcaseBusiness, Compass, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type AboutCard = {
  title: string
  body: string
}

const icons = [Compass, Users, BriefcaseBusiness] as const

export function AboutSection() {
  const { t } = useTranslation()
  const cards = useMemo(
    () => t('about.cards', { returnObjects: true }) as AboutCard[],
    [t],
  )

  return (
    <section className="nr-about" aria-labelledby="about-title">
      <div className="nr-aboutGrid">
        <div className="nr-aboutCopy">
          <div className="nr-sectionHead nr-sectionHead--left">
            <h2 id="about-title">{t('about.title')}</h2>
            <p className="nr-sectionSub">{t('about.subtitle')}</p>
          </div>

          <div className="nr-aboutStatement">
            <span className="nr-aboutIcon" aria-hidden="true">
              <BadgeCheck size={18} strokeWidth={2.1} />
            </span>
            <div>
              <p>{t('about.mainText')}</p>
              <p>{t('about.trustText')}</p>
            </div>
          </div>
        </div>

        <div className="nr-aboutCards">
          {cards.map((card, index) => {
            const Icon = icons[index % icons.length]

            return (
              <article key={card.title} className="nr-aboutCard">
                <span className="nr-aboutCardIcon" aria-hidden="true">
                  <Icon size={17} strokeWidth={2.1} />
                </span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
