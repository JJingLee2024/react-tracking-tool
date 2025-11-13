-- Create a view for event aggregations
create or replace view public.event_summary as
select 
  event_name,
  count(*) as total_count,
  count(distinct session_id) as unique_sessions,
  count(distinct user_id) as unique_users,
  date_trunc('hour', timestamp) as hour,
  date_trunc('day', timestamp) as day
from public.tracking_events
group by event_name, hour, day;

-- Create a view for recent events
create or replace view public.recent_events as
select 
  id,
  event_name,
  session_id,
  user_id,
  properties,
  page_url,
  timestamp
from public.tracking_events
order by timestamp desc
limit 100;
