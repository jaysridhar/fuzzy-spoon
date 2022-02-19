from django.db import models

class UserLocation(models.Model):
    obtained_at = models.DateTimeField(auto_now_add=True)
    latitude = models.FloatField(null=True)
    longitude = models.FloatField(null=True)
    accuracy = models.FloatField(null=True)
    altitude = models.FloatField(null=True)
    altitude_accuracy = models.FloatField(null=True)
    heading = models.FloatField(null=True)
    speed = models.FloatField(null=True)
    class Meta:
        db_table = 'user_location'
