from rest_framework import serializers
from .models import TrainingSession

class TrainingSessionSerializer(serializers.ModelSerializer):
    coach = serializers.CharField(source="coach.full_name")
    duration = serializers.SerializerMethodField()
    levels = serializers.SerializerMethodField()
    direction = serializers.StringRelatedField()
    location = serializers.StringRelatedField()

    class Meta:
        model = TrainingSession
        fields = "__all__"


    def get_duration(self, obj):
        return obj.duration_minutes()

    def get_levels(self, obj):
        return [level.get_tag_display() for level in obj.levels.all()] if obj.levels.exists() else []