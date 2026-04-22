import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';
import { ContentBlocks } from '../../../shared/src/index';

@Entity()
export class FridayAppMessageTable extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => FridayAppReplyTable, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'reply_id' })
    replyId: string;

    @Column()
    name: string;

    @Column()
    role: string;

    @Column('json')
    content: ContentBlocks;

    @Column()
    timestamp: string;
}

@Entity()
export class FridayAppReplyTable extends BaseEntity {
    @PrimaryColumn()
    id: string;

    @Column()
    startTimeStamp: string;

    @Column({ nullable: true })
    endTimeStamp: string;

    @Column()
    finished: boolean;
}
