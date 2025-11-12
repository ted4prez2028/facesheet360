-- Expand CareCoin triggers to ALL user interactions across the entire site
-- This creates passive income for users as they perform their normal work

-- Add triggers to chat/messaging tables
CREATE OR REPLACE TRIGGER distribute_carecoins_on_messages
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to appointment management
CREATE OR REPLACE TRIGGER distribute_carecoins_on_appointments
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to call light interactions
CREATE OR REPLACE TRIGGER distribute_carecoins_on_call_lights
  AFTER INSERT OR UPDATE OR DELETE ON call_lights
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to care task management
CREATE OR REPLACE TRIGGER distribute_carecoins_on_care_tasks
  AFTER INSERT OR UPDATE OR DELETE ON care_tasks
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to care team assignments
CREATE OR REPLACE TRIGGER distribute_carecoins_on_care_team_members
  AFTER INSERT OR UPDATE OR DELETE ON care_team_members
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to driver interactions
CREATE OR REPLACE TRIGGER distribute_carecoins_on_drivers
  AFTER INSERT OR UPDATE OR DELETE ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to ride bookings
CREATE OR REPLACE TRIGGER distribute_carecoins_on_rides
  AFTER INSERT OR UPDATE OR DELETE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to driver ratings
CREATE OR REPLACE TRIGGER distribute_carecoins_on_driver_ratings
  AFTER INSERT OR UPDATE OR DELETE ON driver_ratings
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to clinical alerts acknowledgment
CREATE OR REPLACE TRIGGER distribute_carecoins_on_clinical_alerts
  AFTER INSERT OR UPDATE OR DELETE ON clinical_alerts
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to bill payments
CREATE OR REPLACE TRIGGER distribute_carecoins_on_bill_payments
  AFTER INSERT OR UPDATE OR DELETE ON bill_payments
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to health rewards claims
CREATE OR REPLACE TRIGGER distribute_carecoins_on_health_rewards
  AFTER INSERT OR UPDATE OR DELETE ON health_rewards
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();

-- Add triggers to favorite locations
CREATE OR REPLACE TRIGGER distribute_carecoins_on_favorite_locations
  AFTER INSERT OR UPDATE OR DELETE ON favorite_locations
  FOR EACH ROW
  EXECUTE FUNCTION distribute_carecoins_on_data_change();