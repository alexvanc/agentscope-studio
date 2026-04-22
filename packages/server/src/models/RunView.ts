import { BaseEntity, DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
    expression: (dataSource: DataSource) => {
        const type = String(dataSource.options.type).toLowerCase();
        const isMysql = type === 'mysql' || type === 'mariadb';
        
        const dateMinus1Month = isMysql ? `DATE_SUB(NOW(), INTERVAL 1 MONTH)` : `strftime('%Y-%m-%d %H:%M:%S', 'now', '-1 month')`;
        const dateMinus7Days = isMysql ? `DATE_SUB(NOW(), INTERVAL 7 DAY)` : `strftime('%Y-%m-%d %H:%M:%S', 'now', '-7 days')`;
        const dateMinus1Year = isMysql ? `DATE_SUB(NOW(), INTERVAL 1 YEAR)` : `strftime('%Y-%m-%d %H:%M:%S', 'now', '-1 year')`;
        
        return dataSource
            .createQueryBuilder()
            .select('ca.user_id', 'userId')
            .addSelect('COUNT(DISTINCT run.projectId)', 'totalProjects')
            .addSelect('COUNT(*)', 'totalRuns')
            .addSelect(`COUNT(DISTINCT CASE WHEN run.timestamp > ${dateMinus1Month} THEN run.projectId END)`, 'projectsMonthAgo')
            .addSelect(`COUNT(CASE WHEN run.timestamp > ${dateMinus1Month} THEN 1 END)`, 'runsMonthAgo')
            .addSelect(`COUNT(DISTINCT CASE WHEN run.timestamp > ${dateMinus7Days} THEN run.projectId END)`, 'projectsWeekAgo')
            .addSelect(`COUNT(CASE WHEN run.timestamp > ${dateMinus7Days} THEN 1 END)`, 'runsWeekAgo')
            .addSelect(`COUNT(DISTINCT CASE WHEN run.timestamp > ${dateMinus1Year} THEN run.projectId END)`, 'projectsYearAgo')
            .addSelect(`COUNT(CASE WHEN run.timestamp > ${dateMinus1Year} THEN 1 END)`, 'runsYearAgo')
            .from('run_table', 'run')
            .innerJoin('coding_codingagent', 'ca', 'ca.id = run.projectId')
            .groupBy('ca.user_id');
    },
})
export class RunView extends BaseEntity {
    @ViewColumn()
    userId: string;

    @ViewColumn()
    totalProjects: number;

    @ViewColumn()
    totalRuns: number;

    @ViewColumn()
    projectsWeekAgo: number;

    @ViewColumn()
    runsWeekAgo: number;

    @ViewColumn()
    projectsMonthAgo: number;

    @ViewColumn()
    runsMonthAgo: number;

    @ViewColumn()
    projectsYearAgo: number;

    @ViewColumn()
    runsYearAgo: number;


}
