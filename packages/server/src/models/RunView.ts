import { BaseEntity, DataSource, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
    expression: (dataSource: DataSource) => {
        const type = String(dataSource.options.type).toLowerCase();
        const isMysql = type === 'mysql' || type === 'mariadb';
        
        const dateMinus1Month = isMysql ? `DATE_SUB(NOW(), INTERVAL 1 MONTH)` : `strftime('%Y-%m-%d %H:%M:%S', 'now', '-1 month')`;
        const dateMinus7Days = isMysql ? `DATE_SUB(NOW(), INTERVAL 7 DAY)` : `strftime('%Y-%m-%d %H:%M:%S', 'now', '-7 days')`;
        const dateMinus1Year = isMysql ? `DATE_SUB(NOW(), INTERVAL 1 YEAR)` : `strftime('%Y-%m-%d %H:%M:%S', 'now', '-1 year')`;
        
        const monthlyRunsQuery = isMysql ? `(
            SELECT COALESCE(JSON_ARRAYAGG(
                JSON_OBJECT(
                    'month', monthly_counts.month,
                    'count', monthly_counts.count
                )
            ), '[]')
            FROM (
                SELECT 
                    DATE_FORMAT(run.timestamp, '%Y-%m') as month,
                    COUNT(*) as count
                FROM run_table run
                WHERE run.timestamp > DATE_SUB(NOW(), INTERVAL 11 MONTH)
                GROUP BY DATE_FORMAT(run.timestamp, '%Y-%m')
                ORDER BY month DESC
            ) monthly_counts
        )` : `(
            WITH RECURSIVE
            months(date) AS (
                SELECT date('now', 'start of month', '-11 months')
                UNION ALL
                SELECT date(date, '+1 month')
                FROM months
                WHERE date < date('now', 'start of month')
            ),
            monthly_counts AS (
                SELECT 
                    strftime('%Y-%m', months.date) as month,
                    COUNT(CASE 
                        WHEN strftime('%Y-%m', run.timestamp) = strftime('%Y-%m', months.date) 
                        THEN 1 
                    END) as count
                FROM months
                LEFT JOIN run_table run ON strftime('%Y-%m', run.timestamp) = strftime('%Y-%m', months.date)
                GROUP BY strftime('%Y-%m', months.date)
                ORDER BY month DESC
            )
            SELECT COALESCE(json_group_array(
                json_object(
                    'month', month,
                    'count', count
                )
            ), '[]')
            FROM monthly_counts
        )`;

        return dataSource
            .createQueryBuilder()
            .select('COUNT(DISTINCT run.projectId)', 'totalProjects')
            .addSelect('COUNT(*)', 'totalRuns')
            .addSelect(`COUNT(DISTINCT CASE WHEN run.timestamp > ${dateMinus1Month} THEN run.projectId END)`, 'projectsMonthAgo')
            .addSelect(`COUNT(CASE WHEN run.timestamp > ${dateMinus1Month} THEN 1 END)`, 'runsMonthAgo')
            .addSelect(`COUNT(DISTINCT CASE WHEN run.timestamp > ${dateMinus7Days} THEN run.projectId END)`, 'projectsWeekAgo')
            .addSelect(`COUNT(CASE WHEN run.timestamp > ${dateMinus7Days} THEN 1 END)`, 'runsWeekAgo')
            .addSelect(`COUNT(DISTINCT CASE WHEN run.timestamp > ${dateMinus1Year} THEN run.projectId END)`, 'projectsYearAgo')
            .addSelect(`COUNT(CASE WHEN run.timestamp > ${dateMinus1Year} THEN 1 END)`, 'runsYearAgo')
            .addSelect(monthlyRunsQuery, 'monthlyRuns')
            .from('run_table', 'run');
    },
})
export class RunView extends BaseEntity {
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

    @ViewColumn()
    monthlyRuns: string;
}
