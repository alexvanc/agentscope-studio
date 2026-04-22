import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RenameRunColumns1745195000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('run_table');
        if (!table) return;

        // 1. Rename 'project' to 'projectId' if it exists
        const projectColumn = table.findColumnByName('project');
        const projectIdColumn = table.findColumnByName('projectId');
        if (projectColumn && !projectIdColumn) {
            await queryRunner.renameColumn('run_table', 'project', 'projectId');
        }

        // 2. Rename 'name' to 'run_name' if it exists
        const nameColumn = table.findColumnByName('name');
        const runNameColumn = table.findColumnByName('run_name');
        if (nameColumn && !runNameColumn) {
            await queryRunner.renameColumn('run_table', 'name', 'run_name');
        }

        // 3. Add 'project_name' column if it doesn't exist
        const projectNameColumn = table.findColumnByName('project_name');
        if (!projectNameColumn) {
            await queryRunner.addColumn(
                'run_table',
                new TableColumn({
                    name: 'project_name',
                    type: 'varchar',
                    isNullable: true,
                }),
            );

            // Optional: Initialize project_name with projectId for existing records
            // This ensures display names aren't empty for old data
            await queryRunner.query(
                'UPDATE run_table SET project_name = projectId WHERE project_name IS NULL',
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('run_table');
        if (!table) return;

        // Reverse renaming and column addition
        if (
            table.findColumnByName('projectId') &&
            !table.findColumnByName('project')
        ) {
            await queryRunner.renameColumn('run_table', 'projectId', 'project');
        }

        if (
            table.findColumnByName('run_name') &&
            !table.findColumnByName('name')
        ) {
            await queryRunner.renameColumn('run_table', 'run_name', 'name');
        }

        if (table.findColumnByName('project_name')) {
            await queryRunner.dropColumn('run_table', 'project_name');
        }
    }
}
