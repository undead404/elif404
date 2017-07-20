from .models import Company
from rest_framework import serializers


class CompanySerializer(serializers.ModelSerializer):
    child_companies = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True, required=False)
    # parent = serializers.PrimaryKeyRelatedField(
    #     queryset=Company.objects.all(), required=False)
    # earnings = serializers.IntegerField()
    # id = serializers.IntegerField(read_only=True)
    # title = serializers.CharField(max_length=200)

    class Meta:
        fields = ('child_companies', 'earnings', 'id', 'parent', 'title')
        model = Company
