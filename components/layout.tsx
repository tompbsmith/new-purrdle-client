import styles from './layout.module.scss';

export default function Layout({ children }: any) {
    return (
        <>
            <div className={styles.header}>Purrdle</div>
            <div className={styles.container}>{children}</div>
        </>
    )
}