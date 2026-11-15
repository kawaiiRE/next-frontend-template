import styles from './styles.module.scss';

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      <p className={styles.heading__eyebrow}>{eyebrow}</p>
      <h2 className={styles.heading__title} id={id}>
        {title}
      </h2>
      {description ? <p className={styles.heading__description}>{description}</p> : null}
    </div>
  );
}
