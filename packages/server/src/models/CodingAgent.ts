import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'coding_codingagent', synchronize: false })
export class CodingAgentTable {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: string;

    @Column({ type: 'datetime' })
    create_time: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    deployment_id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 36 })
    user_id: string;
}
