from django.db import models


class Company(models.Model):
    earnings = models.IntegerField(default=0)
    parent = models.ForeignKey(
        'self', blank=True, null=True, on_delete=models.CASCADE, related_name="child_companies")
    title = models.CharField(max_length=200)

    def __str__(self):
        return "{title} ({earnings}$)".format(title=self.title, earnings=self.earnings)

    class Meta:
        ordering = ['title']
