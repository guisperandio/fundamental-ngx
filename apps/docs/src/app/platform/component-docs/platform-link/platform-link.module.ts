import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { API_FILES } from '../../api-files';
import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { SharedDocumentationPageModule } from '../../../documentation/shared-documentation-page.module';

import { PlatformLinkModule } from '@fundamental-ngx/platform/link';
import { PlatformLinkHeaderComponent } from './platform-link-header/platform-link-header.component';
import { PlatformLinkDocsComponent } from './platform-link-docs.component';
import {
    PlatformLinkDisabledEmphasizedExampleComponent,
    PlatformLinkDisabledExampleComponent,
    PlatformLinkEmphasizedExampleComponent,
    PlatformLinkIconExampleComponent,
    PlatformLinkInvertedExampleComponent,
    PlatformLinkStandardExampleComponent,
    PlatformLinkTruncatedExampleComponent
} from './platform-link-examples/platform-link-examples.component';

const routes: Routes = [
    {
        path: '',
        component: PlatformLinkHeaderComponent,
        children: [
            { path: '', component: PlatformLinkDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.link } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedDocumentationPageModule, PlatformLinkModule],
    exports: [RouterModule],
    declarations: [
        PlatformLinkDocsComponent,
        PlatformLinkHeaderComponent,
        PlatformLinkDisabledEmphasizedExampleComponent,
        PlatformLinkDisabledExampleComponent,
        PlatformLinkEmphasizedExampleComponent,
        PlatformLinkIconExampleComponent,
        PlatformLinkInvertedExampleComponent,
        PlatformLinkStandardExampleComponent,
        PlatformLinkTruncatedExampleComponent
    ]
})
export class PlatformLinkDocsModule {}
