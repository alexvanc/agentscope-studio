import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Status } from '../../../../shared/src/types/messageForm.js';
import { InputRequestTable } from '../models/InputRequest';
import { ReplyTable } from '../models/Reply';
import { SpanTable } from './Trace';

@Entity()
export class RunTable extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    projectId: string;

    @Column({ name: 'project_name' })
    project_name: string;

    @Column({ name: 'run_name' })
    run_name: string;

    @Column()
    timestamp: string;

    @Column()
    run_dir: string;

    @Column()
    pid: number;

    @Column({ type: 'varchar', default: Status.DONE })
    status: Status;

    @OneToMany(() => ReplyTable, (reply) => reply.runId)
    replies: ReplyTable[];

    @OneToMany(() => SpanTable, (span) => span.conversationId)
    spans: SpanTable[];

    @OneToMany(() => InputRequestTable, (inputRequest) => inputRequest.runId)
    inputRequests: InputRequestTable[];
}
