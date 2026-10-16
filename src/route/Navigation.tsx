import React, { Suspense } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRouteLayout from './settings/ProtectedRouteLayout';
import PublicRoute from './settings/PublicRoute';
import LoadingPage from '../components/LoadingPage';
import useMenuLinks from './routerLink/useMenuLinks';
import UserView from '../pages/userCRUD/views/UserView';
import { RootState } from '../store/store';
import useRoles from '../rolKeys/getRolKeys';
import RoleView from '../pages/rol&permissions/views/RoleView';
import CreateRolView from '../pages/rol&permissions/views/CreateRolView';
import RoleDetailView from '../pages/rol&permissions/views/RoleDetailView';
import SedeView from '../pages/sedeCRUD/views/SedeView';
import SectorView from '../pages/sectorCRUD/views/SectorView';
import AreaView from '../pages/areaCRUD/views/AreaView';
import UsersInSedeView from '../pages/UsersInSede/views/UsersInSedeView';
import CategoriaView from '../pages/CategoryChecklistCrud/views/CategoriaView';
import UsersInCategoryView from '../pages/UserInCategory/views/UsersInCategoryView';
import AreaQRView from '../pages/AreaQR/views/AreaQRView';
import ChecklistConfigView from '../pages/ChecklistConfig/views/ChecklistConfigView';
import Home from '../pages/home/views/home';

import ChecklistReportsView from '../pages/Revisions&Results/views/ChecklistReportsView';
import ChecklistReportResultView from '../pages/Revisions&Results/views/ChecklistReportResultView';
import ScheduleView from '../pages/Revisions&Results/views/ScheduleView';
import RevisionsView from '../pages/Revisions&Results/views/RevisionsView';
import ChecklistGestorView from '../pages/CheckListManagerListPrograming/views/ChecklistView';
import SecurityView from '../pages/userCRUD/views/SecurityView';
import ProfileView from '../pages/userCRUD/views/ProfileView';
import RevisionDetailView from '../pages/Revisions&Results/views/RevisionDetailView';
import ChecklistDashboardView from '../pages/ChecklistDashboard/views/ChecklistDashboardView';

const Login = React.lazy(() => import('../pages/auth/views/Login'));
const ResetPassword = React.lazy(() => import('../pages/auth/views/ResetPassword'));

type UsePermissionsHook = {
  hasPermission: (roleKey: string) => boolean;
  getRoleKeyByName: (name: string) => string | null;
};

const usePermissions = (): UsePermissionsHook => {
  const { getRoleKeyByName } = useRoles();
  const user = useSelector((state: RootState) => state.user.user);

  const hasPermission = (nameOrKey: string = ''): boolean => {
    if (!nameOrKey) return false;
    if (user?.rol_name?.toLowerCase().includes('admin') || user?.rol === 'admin' || user?.user === 'admin') {
      return true;
    }
    const resolvedKey = getRoleKeyByName(nameOrKey);
    return Boolean(
      user?.permissions?.includes(nameOrKey) ||
      (resolvedKey && user?.permissions?.includes(resolvedKey))
    );
  };

  return { hasPermission, getRoleKeyByName };
};

const RouteAdministration = () => {
  const { hasPermission } = usePermissions();
  const { getLinkByName } = useMenuLinks();

  const renderRoute = (path: string, element: React.ReactElement, accesible: boolean = true) => (
    <Route
      key={path}
      path={path}
      element={accesible ? element : <Navigate to="/" replace />}
    />
  );

  return (
    <>
      {renderRoute("/", <Home />, true)}

      {/* Seguridad y Perfil */}
      {renderRoute(getLinkByName('PassUser'), <SecurityView />, hasPermission('PassUser'))}
      {renderRoute(getLinkByName('profileUser'), <ProfileView />, hasPermission('profileUser'))}

      {/* Módulo de Administración */}
      {renderRoute(getLinkByName('userManager'), <UserView />, hasPermission('userManager'))}
      {renderRoute(getLinkByName('permissionManager'), <RoleView />, hasPermission('permissionManager'))}
      {renderRoute(getLinkByName('permissionManagerADDRol'), <CreateRolView />, hasPermission('permissionManager'))}
      {renderRoute(getLinkByName('permissionManagerADDPermission'), <RoleView />, hasPermission('permissionManager'))}
      {renderRoute(getLinkByName('roleDetail'), <RoleDetailView />, hasPermission('permissionManager'))}
      {renderRoute(getLinkByName('usersLocations'), <UsersInSedeView />, hasPermission('usersLocations'))}

      {/* Módulo Gestor de Técnicos */}
      {renderRoute(getLinkByName('sedesManager'), <SedeView />, hasPermission('sedesManager'))}
      {renderRoute(getLinkByName('sectorManager'), <SectorView />, hasPermission('sectorManager'))}
      {renderRoute(getLinkByName('areaManager'), <AreaView />, hasPermission('areaManager'))}
      {renderRoute(getLinkByName('categoryChecklist'), <CategoriaView />, hasPermission('categoryChecklist'))}
      {renderRoute(getLinkByName('GenerateQR'), <AreaQRView />, hasPermission('GenerateQR'))}
      {renderRoute(getLinkByName('checklistConfig'), <ChecklistConfigView />, hasPermission('checklistConfig'))}

      {/* Módulo de Checklist */}
      {renderRoute(getLinkByName('ChecklistView'), <ChecklistDashboardView />, true)}
      {renderRoute(getLinkByName('checkListManager'), <ChecklistGestorView />, hasPermission('checkListManager'))}
      {renderRoute(getLinkByName('registerReviewWeb'), <ScheduleView />, hasPermission('registerReviewWeb'))}
      {renderRoute(getLinkByName('review&results'), <RevisionsView />, hasPermission('review&results'))}
      {renderRoute(getLinkByName('usersCategories'), <UsersInCategoryView />, hasPermission('usersCategories'))}
      {renderRoute(getLinkByName('checklistReports'), <ChecklistReportsView />, hasPermission('checklistReports'))}
      {renderRoute(getLinkByName('checklistReportResult'), <ChecklistReportResultView />, hasPermission('checklistReports'))}
      {renderRoute(getLinkByName('revisionDetail'), <RevisionDetailView />, hasPermission('review&results'))}
    </>
  );
};

const Navigation = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingPage />}>
                <Login />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <Suspense fallback={<LoadingPage />}>
                <ResetPassword />
              </Suspense>
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRouteLayout>
              <Routes>
                {RouteAdministration()}
              </Routes>
            </ProtectedRouteLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export { Navigation };
export default Navigation;
