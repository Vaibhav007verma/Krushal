const {
  dbConnections,
  initializeAllRepositories,
  regenerateUpdatedAtTriggers,
  getDBConnections
} = require('@krushal-it/ah-orm')

const { OptionallyTakeDBBackup } = require('./dbbackup')
const {INITIALIZATION_SCREEN_STATES} = require('./constants')
import {
  setAuthenticationCheckState,
  setDBInitialization,
  setInitializationState,
  setLoggedInUserDeviceId,
  setInitialDBBackupState
} from '../redux/actions/appStateOnPhone'


const initializeDB = async (/*setInitializationState*/ dispatch, persistentAppStateOnPhone, initialDBBackupState) => {
  try {
    await initializeAllRepositories(dbConnections())
    await regenerateUpdatedAtTriggers()
    for (let i = 0; i < 10000000; i++) {}
    if (!initialDBBackupState) {
      const backupResponse = await OptionallyTakeDBBackup(dispatch, persistentAppStateOnPhone)
  
      if (backupResponse >= 0) {
        dispatch(setInitialDBBackupState(true))
        dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_USER_AUTHENTICATION_SCREEN))
      }
    }
  
  } catch (error) {
    console.log('error in initializing database')
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.ERROR_DB_NOT_LOADED_MESSAGE_SCREEN))
  }
  // await getDBConnections().main.manager.query('delete from ref_reference')
  /*
        await queryRunner.query(`CREATE TABLE "temporary_document" ("document_id" varchar PRIMARY KEY NOT NULL DEFAULT ((lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))), "document_type_id" integer NOT NULL, "document_name" varchar(256), "document_status_id" integer, "entity_1_type_id" integer, "entity_1_entity_uuid" varchar, "entity_1_entity_id" integer, "entity_2_type_id" integer, "entity_2_entity_uuid" varchar, "entity_2_entity_id" integer, "entity_3_type_id" integer, "entity_3_entity_uuid" varchar, "entity_3_entity_id" integer, "client_document_information" text, "document_information" text, "document_meta_data_information" text, "active" integer NOT NULL DEFAULT (1000100001), "last_modifying_user_id" varchar, "correlation_id" varchar(256), "data_sync_status" integer NOT NULL DEFAULT (1000101003), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "document_sync_status" integer NOT NULL DEFAULT (1000102002))`);
        await queryRunner.query(`INSERT INTO "temporary_document"("document_id", "document_type_id", "document_name", "document_status_id", "entity_1_type_id", "entity_1_entity_uuid", "entity_1_entity_id", "entity_2_type_id", "entity_2_entity_uuid", "entity_2_entity_id", "entity_3_type_id", "entity_3_entity_uuid", "entity_3_entity_id", "client_document_information", "document_information", "document_meta_data_information", "active", "last_modifying_user_id", "correlation_id", "data_sync_status", "created_at", "updated_at") SELECT "document_id", "document_type_id", "document_name", "document_status_id", "entity_1_type_id", "entity_1_entity_uuid", "entity_1_entity_id", "entity_2_type_id", "entity_2_entity_uuid", "entity_2_entity_id", "entity_3_type_id", "entity_3_entity_uuid", "entity_3_entity_id", "client_document_information", "document_information", "document_meta_data_information", "active", "last_modifying_user_id", "correlation_id", "data_sync_status", "created_at", "updated_at" FROM "document"`);
        await queryRunner.query(`DROP TABLE "document"`);
        await queryRunner.query(`ALTER TABLE "temporary_document" RENAME TO "document"`);
        await queryRunner.query(`CREATE TABLE "temporary_document" ("document_id" varchar PRIMARY KEY NOT NULL DEFAULT ((lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))), "document_type_id" integer NOT NULL, "document_name" varchar(256), "document_status_id" integer, "entity_1_type_id" integer, "entity_1_entity_uuid" varchar, "entity_1_entity_id" integer, "entity_2_type_id" integer, "entity_2_entity_uuid" varchar, "entity_2_entity_id" integer, "entity_3_type_id" integer, "entity_3_entity_uuid" varchar, "entity_3_entity_id" integer, "client_document_information" text, "document_information" text, "document_meta_data_information" text, "active" integer NOT NULL DEFAULT (1000100001), "last_modifying_user_id" varchar, "correlation_id" varchar(256), "data_sync_status" integer NOT NULL DEFAULT (1000101003), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "document_sync_status" integer NOT NULL DEFAULT (1000102002))`);
        await queryRunner.query(`INSERT INTO "temporary_document"("document_id", "document_type_id", "document_name", "document_status_id", "entity_1_type_id", "entity_1_entity_uuid", "entity_1_entity_id", "entity_2_type_id", "entity_2_entity_uuid", "entity_2_entity_id", "entity_3_type_id", "entity_3_entity_uuid", "entity_3_entity_id", "client_document_information", "document_information", "document_meta_data_information", "active", "last_modifying_user_id", "correlation_id", "data_sync_status", "created_at", "updated_at", "document_sync_status") SELECT "document_id", "document_type_id", "document_name", "document_status_id", "entity_1_type_id", "entity_1_entity_uuid", "entity_1_entity_id", "entity_2_type_id", "entity_2_entity_uuid", "entity_2_entity_id", "entity_3_type_id", "entity_3_entity_uuid", "entity_3_entity_id", "client_document_information", "document_information", "document_meta_data_information", "active", "last_modifying_user_id", "correlation_id", "data_sync_status", "created_at", "updated_at", "document_sync_status" FROM "document"`);
        await queryRunner.query(`DROP TABLE "document"`);
        await queryRunner.query(`ALTER TABLE "temporary_document" RENAME TO "document"`);
        await queryRunner.query(`CREATE TABLE "entity_geography" ("entity_geography_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "entity_type_id" integer, "entity_uuid" varchar, "entity_id" integer, "geography_type_id" integer, "geography_id" integer, "start_date" datetime DEFAULT ('1900-01-01 00:00:01'), "end_date" datetime DEFAULT ('2099-12-31 23:59:59'), "active" integer NOT NULL DEFAULT (1000100001), "last_modifying_user_id" varchar, "correlation_id" varchar(256), "data_sync_status" integer NOT NULL DEFAULT (1000101003), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);


  */
  // await getDBConnections().main.manager.query('delete from animal_classification')
  // console.log('getDBConnections().main.repos.document = ', getDBConnections().main.repos.document)
  // console.log('getDBConnections().main.entities.document = ', getDBConnections().main.entities.document)
  // const documentResults1 = await getDBConnections().main.manager.query('delete from document')
  // const animalClassificationResults1 = await getDBConnections().main.manager.query("delete from animal_classification where animal_classification_id = '88e66217-9306-11ed-ab61-79e9896ad103'")
  // const customerClassificationResults1 = await getDBConnections().main.manager.query("delete from customer_classification where customer_classification_id = 'fab98cc4-a13b-11ed-b79f-2f56825be058'")
  // const stateResults = await getDBConnections().main.manager.query("select * from ref_state")
  // const districtResults = await getDBConnections().main.manager.query("select * from ref_district")
  // const talukResults = await getDBConnections().main.manager.query("select * from ref_taluk")
  // const villageResults = await getDBConnections().main.manager.query("select * from ref_village")
  // console.log('stateResults = ', stateResults)
  // console.log('districtResults = ', districtResults)
  // console.log('talukResults = ', talukResults)
  // console.log('villageResults = ', villageResults)

  // const documentResults2 = await getDBConnections().main.manager.query(`CREATE TABLE "entity_geography" ("entity_geography_id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "entity_type_id" integer, "entity_uuid" varchar, "entity_id" integer, "geography_type_id" integer, "geography_id" integer, "start_date" datetime DEFAULT ('1900-01-01 00:00:01'), "end_date" datetime DEFAULT ('2099-12-31 23:59:59'), "active" integer NOT NULL DEFAULT (1000100001), "last_modifying_user_id" varchar, "correlation_id" varchar(256), "data_sync_status" integer NOT NULL DEFAULT (1000101003), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`)
  // const documentResults = await getDBConnections().main.manager.query('select * from document')
  // console.log('documentResults = ', documentResults)
  // unsubscribe()
}

module.exports = {initializeDB}