-- Create tables for taxi service, notifications, and ride management

-- Create rides table
CREATE TABLE public.rides (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    pickup_location TEXT NOT NULL,
    dropoff_location TEXT NOT NULL,
    ride_type TEXT NOT NULL, -- 'to_facility', 'from_facility', 'between_facilities', 'to_appointment', 'home'
    patient_id UUID NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NULL,
    estimated_cost_carecoins INTEGER NOT NULL DEFAULT 0,
    actual_cost_carecoins INTEGER NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'driver_assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'
    driver_id UUID NULL,
    driver_name TEXT NULL,
    driver_phone TEXT NULL,
    vehicle_info TEXT NULL,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE NULL,
    pickup_time TIMESTAMP WITH TIME ZONE NULL,
    dropoff_time TIMESTAMP WITH TIME ZONE NULL,
    route_data JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_logs table for tracking sent notifications
CREATE TABLE public.notification_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NULL,
    user_id UUID NULL,
    notification_type TEXT NOT NULL,
    message TEXT NOT NULL,
    phone_number TEXT NULL,
    email_address TEXT NULL,
    sms_sent BOOLEAN NOT NULL DEFAULT false,
    email_sent BOOLEAN NOT NULL DEFAULT false,
    app_notification_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drivers table for taxi service
CREATE TABLE public.drivers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NULL,
    license_number TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year INTEGER NOT NULL,
    vehicle_color TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'busy', 'offline'
    current_location JSONB NULL, -- {lat: number, lng: number}
    rating NUMERIC(2,1) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rides
CREATE POLICY "Users can view their own rides" 
ON public.rides 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rides" 
ON public.rides 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rides" 
ON public.rides 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Drivers can view assigned rides" 
ON public.rides 
FOR SELECT 
USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can update assigned rides" 
ON public.rides 
FOR UPDATE 
USING (auth.uid() = driver_id);

-- Create RLS policies for notification_logs
CREATE POLICY "Healthcare providers can view notification logs" 
ON public.notification_logs 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for drivers
CREATE POLICY "Drivers can view their own profile" 
ON public.drivers 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Drivers can update their own profile" 
ON public.drivers 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Anyone can view available drivers" 
ON public.drivers 
FOR SELECT 
USING (status = 'available');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_rides()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rides_updated_at
    BEFORE UPDATE ON public.rides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_rides();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample drivers
INSERT INTO public.drivers (name, phone, email, license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, license_plate, status) VALUES
('John Smith', '+1-555-0101', 'john.smith@rideco.com', 'DL123456789', 'Toyota', 'Camry', 2022, 'Silver', 'ABC123', 'available'),
('Maria Garcia', '+1-555-0102', 'maria.garcia@rideco.com', 'DL987654321', 'Honda', 'Accord', 2021, 'Blue', 'XYZ789', 'available'),
('David Chen', '+1-555-0103', 'david.chen@rideco.com', 'DL456789123', 'Nissan', 'Altima', 2023, 'White', 'DEF456', 'available'),
('Sarah Johnson', '+1-555-0104', 'sarah.johnson@rideco.com', 'DL789123456', 'Hyundai', 'Elantra', 2022, 'Black', 'GHI789', 'available');