from django.db import models

class UserLocation(models.Model):
    NEWSTATUS = 'new'
    APPROVED = 'approved'
    DENIED = 'denied'
    STATUSES = (
        (NEWSTATUS, 'New'),
        (APPROVED, 'Approved'),
        (DENIED, 'Denied')
    )
    obtained_at = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    accuracy = models.FloatField(null=True)
    altitude = models.FloatField(null=True)
    altitude_accuracy = models.FloatField(null=True)
    heading = models.FloatField(null=True)
    speed = models.FloatField(null=True)
    status = models.CharField(max_length=10, choices=STATUSES, default=NEWSTATUS)
    google_maps_location = models.TextField(null=True)
    class Meta:
        db_table = 'user_location'
