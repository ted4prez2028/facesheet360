-- Add missing RLS policies for remaining tables

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all user roles" ON public.user_roles 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can assign roles" ON public.user_roles 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles 
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for care_plans
CREATE POLICY "Healthcare staff can view care plans" ON public.care_plans 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    EXISTS (SELECT 1 FROM public.patient_assignments WHERE patient_id = care_plans.patient_id AND assigned_to = auth.uid())
  );

CREATE POLICY "Healthcare staff can create care plans" ON public.care_plans 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Healthcare staff can update care plans" ON public.care_plans 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for patient_notes
CREATE POLICY "Healthcare staff can view notes" ON public.patient_notes 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    EXISTS (SELECT 1 FROM public.patient_assignments WHERE patient_id = patient_notes.patient_id AND assigned_to = auth.uid())
  );

CREATE POLICY "Healthcare staff can create notes" ON public.patient_notes 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

CREATE POLICY "Healthcare staff can update unlocked notes" ON public.patient_notes 
  FOR UPDATE USING (
    NOT is_locked AND (
      public.has_role(auth.uid(), 'doctor') OR
      public.has_role(auth.uid(), 'nurse')
    )
  );

-- RLS Policies for lab_results
CREATE POLICY "Healthcare staff can view lab results" ON public.lab_results 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Doctors can create lab orders" ON public.lab_results 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Healthcare staff can update lab results" ON public.lab_results 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for imaging_studies
CREATE POLICY "Healthcare staff can view imaging" ON public.imaging_studies 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Doctors can order imaging" ON public.imaging_studies 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Healthcare staff can update imaging" ON public.imaging_studies 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for patient_assignments
CREATE POLICY "Healthcare staff can view assignments" ON public.patient_assignments 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Admins can create assignments" ON public.patient_assignments 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor')
  );

CREATE POLICY "Admins can delete assignments" ON public.patient_assignments 
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor')
  );

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON public.conversations 
  FOR SELECT USING (
    participant_1_id = auth.uid() OR 
    participant_2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations" ON public.conversations 
  FOR INSERT WITH CHECK (
    participant_1_id = auth.uid() OR 
    participant_2_id = auth.uid()
  );

-- RLS Policies for wound_assessments
CREATE POLICY "Healthcare staff can view wound assessments" ON public.wound_assessments 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Healthcare staff can create wound assessments" ON public.wound_assessments 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

-- RLS Policies for call_lights
CREATE POLICY "Healthcare staff can view call lights" ON public.call_lights 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

CREATE POLICY "Patients can create call lights" ON public.call_lights 
  FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare staff can update call lights" ON public.call_lights 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

-- RLS Policies for group_calls
CREATE POLICY "Participants can view group calls" ON public.group_calls 
  FOR SELECT USING (
    auth.uid() IN (SELECT jsonb_array_elements_text(participants)::uuid)
  );

CREATE POLICY "Users can create group calls" ON public.group_calls 
  FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Participants can update group calls" ON public.group_calls 
  FOR UPDATE USING (
    auth.uid() IN (SELECT jsonb_array_elements_text(participants)::uuid)
  );

-- RLS Policies for care_coins_transactions
CREATE POLICY "Users can view own transactions" ON public.care_coins_transactions 
  FOR SELECT USING (
    user_id = auth.uid() OR
    from_user_id = auth.uid() OR
    to_user_id = auth.uid()
  );

CREATE POLICY "Users can create transactions" ON public.care_coins_transactions 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    from_user_id = auth.uid()
  );

-- RLS Policies for bill_payments
CREATE POLICY "Users can view own bill payments" ON public.bill_payments 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bill payments" ON public.bill_payments 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bill payments" ON public.bill_payments 
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for achievements
CREATE POLICY "Users can view own achievements" ON public.achievements 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create achievements" ON public.achievements 
  FOR INSERT WITH CHECK (TRUE);

-- Enable RLS and add policies for carecoin_contract
ALTER TABLE public.carecoin_contract ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view carecoin contract" ON public.carecoin_contract 
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage carecoin contract" ON public.carecoin_contract 
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for food_orders
CREATE POLICY "Healthcare staff can view food orders" ON public.food_orders 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

CREATE POLICY "Healthcare staff can create food orders" ON public.food_orders 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

CREATE POLICY "Healthcare staff can update food orders" ON public.food_orders 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'cna')
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view assigned tasks" ON public.tasks 
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Healthcare staff can create tasks" ON public.tasks 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update assigned tasks" ON public.tasks 
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for evaluations
CREATE POLICY "Healthcare staff can view evaluations" ON public.evaluations 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'therapist')
  );

CREATE POLICY "Therapists can create evaluations" ON public.evaluations 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'therapist') OR
    public.has_role(auth.uid(), 'doctor')
  );

-- RLS Policies for immunizations
CREATE POLICY "Healthcare staff can view immunizations" ON public.immunizations 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Healthcare staff can record immunizations" ON public.immunizations 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for medical_diagnoses
CREATE POLICY "Healthcare staff can view diagnoses" ON public.medical_diagnoses 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Doctors can create diagnoses" ON public.medical_diagnoses 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update diagnoses" ON public.medical_diagnoses 
  FOR UPDATE USING (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for allergies
CREATE POLICY "Healthcare staff can view allergies" ON public.allergies 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'pharmacist')
  );

CREATE POLICY "Healthcare staff can record allergies" ON public.allergies 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Healthcare staff can update allergies" ON public.allergies 
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for advanced_directives
CREATE POLICY "Healthcare staff can view directives" ON public.advanced_directives 
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse')
  );

CREATE POLICY "Doctors can create directives" ON public.advanced_directives 
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor'));

CREATE POLICY "Doctors can update directives" ON public.advanced_directives 
  FOR UPDATE USING (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for rides
CREATE POLICY "Users can view own rides" ON public.rides 
  FOR SELECT USING (
    user_id = auth.uid() OR
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can create rides" ON public.rides 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rides" ON public.rides 
  FOR UPDATE USING (
    user_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Enable RLS and add policies for ai_improvements
ALTER TABLE public.ai_improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ai improvements" ON public.ai_improvements 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create ai improvements" ON public.ai_improvements 
  FOR INSERT WITH CHECK (TRUE);

-- Enable RLS and add policies for app_evolution_metrics
ALTER TABLE public.app_evolution_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics" ON public.app_evolution_metrics 
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert metrics" ON public.app_evolution_metrics 
  FOR INSERT WITH CHECK (TRUE);