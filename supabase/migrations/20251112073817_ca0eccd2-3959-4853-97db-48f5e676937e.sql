-- ===========================================================
-- RLS POLICIES FOR ALL NEW TABLES
-- ===========================================================

-- ============================================
-- IDEA 1: Clinical Decision Support - RLS
-- ============================================

-- medication_interactions (system-wide reference data)
CREATE POLICY "Anyone can view medication interactions"
  ON public.medication_interactions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage medication interactions"
  ON public.medication_interactions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- clinical_guidelines (system-wide reference data)
CREATE POLICY "Healthcare staff can view guidelines"
  ON public.clinical_guidelines FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage guidelines"
  ON public.clinical_guidelines FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- clinical_alerts
CREATE POLICY "Healthcare staff can view patient alerts"
  ON public.clinical_alerts FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can acknowledge alerts"
  ON public.clinical_alerts FOR UPDATE
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

CREATE POLICY "System can create alerts"
  ON public.clinical_alerts FOR INSERT
  WITH CHECK (true);

-- ============================================
-- IDEA 2: Care Coordination - RLS
-- ============================================

-- care_team_members
CREATE POLICY "Healthcare staff can view care teams"
  ON public.care_team_members FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can manage care teams"
  ON public.care_team_members FOR ALL
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- discharge_plans
CREATE POLICY "Healthcare staff can view discharge plans"
  ON public.discharge_plans FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can create discharge plans"
  ON public.discharge_plans FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "Healthcare staff can update discharge plans"
  ON public.discharge_plans FOR UPDATE
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

-- care_tasks
CREATE POLICY "Assigned users can view tasks"
  ON public.care_tasks FOR SELECT
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can create tasks"
  ON public.care_tasks FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

CREATE POLICY "Assigned users can update tasks"
  ON public.care_tasks FOR UPDATE
  USING (assigned_to = auth.uid() OR assigned_by = auth.uid());

-- ============================================
-- IDEA 3: Predictive Analytics - RLS
-- ============================================

-- patient_risk_scores
CREATE POLICY "Healthcare staff can view risk scores"
  ON public.patient_risk_scores FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage risk scores"
  ON public.patient_risk_scores FOR ALL
  WITH CHECK (true);

-- capacity_metrics
CREATE POLICY "Healthcare staff can view capacity"
  ON public.capacity_metrics FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage capacity"
  ON public.capacity_metrics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- IDEA 5: HIPAA Compliance - RLS
-- ============================================

-- phi_access_logs
CREATE POLICY "Admins can view phi access logs"
  ON public.phi_access_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert phi logs"
  ON public.phi_access_logs FOR INSERT
  WITH CHECK (true);

-- data_retention_policies
CREATE POLICY "Admins can manage retention policies"
  ON public.data_retention_policies FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- patient_consents
CREATE POLICY "Healthcare staff can view consents"
  ON public.patient_consents FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can manage consents"
  ON public.patient_consents FOR ALL
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- IDEA 6: Authentication - RLS
-- ============================================

-- user_mfa_settings
CREATE POLICY "Users can view own MFA settings"
  ON public.user_mfa_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own MFA"
  ON public.user_mfa_settings FOR ALL
  USING (user_id = auth.uid());

-- user_devices
CREATE POLICY "Users can view own devices"
  ON public.user_devices FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own devices"
  ON public.user_devices FOR ALL
  USING (user_id = auth.uid());

-- user_sessions
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can revoke own sessions"
  ON public.user_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can manage sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- IDEA 7 & 8: Patient Portal - RLS
-- ============================================

-- patient_portal_users
CREATE POLICY "Users can view own portal access"
  ON public.patient_portal_users FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can request portal access"
  ON public.patient_portal_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage portal access"
  ON public.patient_portal_users FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- medication_administration_log
CREATE POLICY "Caregivers can log medication"
  ON public.medication_administration_log FOR INSERT
  WITH CHECK (administered_by = auth.uid());

CREATE POLICY "Healthcare staff can view med logs"
  ON public.medication_administration_log FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR administered_by = auth.uid());

-- ============================================
-- IDEA 9: CareCoin Ecosystem - RLS
-- ============================================

-- carecoin_merchants
CREATE POLICY "Anyone can view active merchants"
  ON public.carecoin_merchants FOR SELECT
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage merchants"
  ON public.carecoin_merchants FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- health_rewards
CREATE POLICY "Users can view own rewards"
  ON public.health_rewards FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can award rewards"
  ON public.health_rewards FOR INSERT
  WITH CHECK (true);

-- carecoin_staking
CREATE POLICY "Users can view own stakes"
  ON public.carecoin_staking FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create stakes"
  ON public.carecoin_staking FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stakes"
  ON public.carecoin_staking FOR UPDATE
  USING (user_id = auth.uid());

-- insurance_payments
CREATE POLICY "Healthcare staff can view insurance payments"
  ON public.insurance_payments FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can record insurance payments"
  ON public.insurance_payments FOR INSERT
  WITH CHECK (true);

-- ============================================
-- IDEA 13: Healthcare Integrations - RLS
-- ============================================

-- hl7_message_log
CREATE POLICY "Healthcare staff can view HL7 logs"
  ON public.hl7_message_log FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage HL7 messages"
  ON public.hl7_message_log FOR ALL
  WITH CHECK (true);

-- external_system_mappings
CREATE POLICY "Healthcare staff can view mappings"
  ON public.external_system_mappings FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage mappings"
  ON public.external_system_mappings FOR ALL
  WITH CHECK (true);

-- external_lab_orders
CREATE POLICY "Healthcare staff can view lab orders"
  ON public.external_lab_orders FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Doctors can create lab orders"
  ON public.external_lab_orders FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "System can update lab results"
  ON public.external_lab_orders FOR UPDATE
  WITH CHECK (true);