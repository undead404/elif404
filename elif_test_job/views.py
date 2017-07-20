from django.http import Http404
from django.shortcuts import render
from django.views.decorators.cache import cache_control
from rest_framework import generics, mixins, status, views, viewsets
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer


@cache_control(private=False)
def index(request):
    return render(request, 'index.html')


# class CompanyViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
#     queryset = Company.objects.filter(parent__isnull=True)
#     serializer_class = CompanySerializer

class CompanyDetail(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.DestroyModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class CompanyList(mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView):
    queryset = Company.objects.filter(parent__isnull=True)
    serializer_class = CompanySerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        parent_id = kwargs.get('parent')
        if parent_id is not None:
            # del kwargs['parent_id']
            kwargs['parent'] = Company.objects.get(pk=parent_id)
        return self.create(request, *args, **kwargs)
