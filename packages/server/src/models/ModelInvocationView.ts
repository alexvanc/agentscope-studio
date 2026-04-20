import { BaseEntity, DataSource, ViewColumn, ViewEntity } from 'typeorm';
import { SpanTable } from './Trace';

@ViewEntity({
    expression: (dataSource: DataSource) => {
        const type = String(dataSource.options.type).toLowerCase();
        const isMysql = type === 'mysql' || type === 'mariadb';
        
        const dateMinus1MonthNano = isMysql ? `(UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 MONTH)) * 1000000000)` : `(strftime('%s', 'now', '-1 month') * 1000000000)`;
        const dateMinus7DaysNano = isMysql ? `(UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 7 DAY)) * 1000000000)` : `(strftime('%s', 'now', '-7 days') * 1000000000)`;
        const dateMinus1YearNano = isMysql ? `(UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 YEAR)) * 1000000000)` : `(strftime('%s', 'now', '-1 year') * 1000000000)`;

        return dataSource
            .createQueryBuilder()
            .from(SpanTable, 'span')
            .innerJoin('run_table', 'run', 'run.id = span.conversationId')
            .select(
                `COUNT(CASE
                    WHEN (span.operationName = 'chat'
                         OR span.operationName = 'chat_model')
                    THEN 1
                END)`,
                'totalModelInvocations',
            )
            .addSelect(
                `COALESCE(SUM(CASE
            WHEN span.totalTokens IS NOT NULL
            AND (span.operationName = 'chat'
                 OR span.operationName = 'chat_model')
            THEN CAST(span.totalTokens AS INTEGER)
            ELSE 0
        END), 0)`,
                'totalTokens',
            )
            .addSelect(
                `COUNT(CASE
            WHEN span.totalTokens IS NOT NULL
            AND (span.operationName = 'chat'
                 OR span.operationName = 'chat_model')
            THEN 1
        END)`,
                'chatModelInvocations',
            )
            // A month ago
            .addSelect(
                `COALESCE(SUM(CASE
            WHEN span.totalTokens IS NOT NULL
            AND (span.operationName = 'chat'
                 OR span.operationName = 'chat_model')
            AND span.startTimeUnixNano > ${dateMinus1MonthNano}
            THEN CAST(span.totalTokens AS INTEGER)
            ELSE 0
        END), 0)`,
                'tokensMonthAgo',
            )
            // A week ago
            .addSelect(
                `COALESCE(SUM(CASE
            WHEN span.totalTokens IS NOT NULL
            AND (span.operationName = 'chat'
                 OR span.operationName = 'chat_model')
            AND span.startTimeUnixNano > ${dateMinus7DaysNano}
            THEN CAST(span.totalTokens AS INTEGER)
            ELSE 0
        END), 0)`,
                'tokensWeekAgo',
            )
            // A year ago
            .addSelect(
                `COALESCE(SUM(CASE
            WHEN span.totalTokens IS NOT NULL
            AND (span.operationName = 'chat'
                 OR span.operationName = 'chat_model')
            AND span.startTimeUnixNano > ${dateMinus1YearNano}
            THEN CAST(span.totalTokens AS INTEGER)
            ELSE 0
        END), 0)`,
                'tokensYearAgo',
            )
            // A month ago
            .addSelect(
                `COUNT(CASE
                    WHEN (span.operationName = 'chat'
                         OR span.operationName = 'chat_model')
                    AND span.startTimeUnixNano > ${dateMinus1MonthNano}
                    THEN 1
                END)`,
                'modelInvocationsMonthAgo',
            )
            // A week ago
            .addSelect(
                `COUNT(CASE
                    WHEN (span.operationName = 'chat'
                         OR span.operationName = 'chat_model')
                    AND span.startTimeUnixNano > ${dateMinus7DaysNano}
                    THEN 1
                END)`,
                'modelInvocationsWeekAgo',
            )
            // A year ago
            .addSelect(
                `COUNT(CASE
                    WHEN (span.operationName = 'chat'
                         OR span.operationName = 'chat_model')
                    AND span.startTimeUnixNano > ${dateMinus1YearNano}
                    THEN 1
                END)`,
                'modelInvocationsYearAgo',
            );
    },
})
export class ModelInvocationView extends BaseEntity {
    @ViewColumn()
    totalModelInvocations: number;

    @ViewColumn()
    totalTokens: number;

    @ViewColumn()
    chatModelInvocations: number;

    @ViewColumn()
    tokensWeekAgo: number;

    @ViewColumn()
    tokensMonthAgo: number;

    @ViewColumn()
    tokensYearAgo: number;

    @ViewColumn()
    modelInvocationsWeekAgo: number;

    @ViewColumn()
    modelInvocationsMonthAgo: number;

    @ViewColumn()
    modelInvocationsYearAgo: number;
}
